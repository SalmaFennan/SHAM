const Member = require('../models/Membre');
const Transaction = require('../models/Transaction');
const Joi = require('joi');
const fs = require('fs').promises; // Utilisation de fs.promises pour opérations asynchrones
const path = require('path');

// Schéma de validation amélioré avec valeurs par défaut
const memberSchema = Joi.object({
  nom: Joi.string().required().max(50),
  prenom: Joi.string().required().max(50),
  email: Joi.string().email().required().max(100),
  telephone: Joi.string().pattern(/^[0-9]{10}$/).allow('', null),
  date_adhesion: Joi.date().required(),
  date_expiration: Joi.date().optional(),
  type_adhesion: Joi.string().valid('mixte', 'femme').insensitive().default('mixte'),
  pack: Joi.string().valid('1mois', '3mois', '6mois', '12mois', '3moisDuo', '6moisDuo', '12moisDuo').default('1mois'),
  prix_paye: Joi.number().min(0).default(0),
  assurance_payee: Joi.boolean().default(false),
  statut: Joi.string().valid('actif', 'expiré', 'suspendu').default('actif'),
  photo_url: Joi.string().uri().allow('', null)
});

// Middleware pour normaliser les données des membres
const normalizeMemberData = (memberData) => ({
  ...memberData,
  pack: memberData.pack || '1mois',
  type_adhesion: memberData.type_adhesion || 'mixte',
  statut: memberData.statut || 'actif',
  prix_paye: Number(memberData.prix_paye) || 0,
  assurance_payee: memberData.assurance_payee === 'true' || memberData.assurance_payee === true
});

exports.getAllMembers = async (req, res) => {
  try {
    let members = await Member.getAll();
    members = members.map(member => ({
      ...member,
      date_adhesion: member.date_adhesion || new Date().toISOString().split('T')[0],
      date_expiration: member.date_expiration || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      pack: member.pack || '1mois',
      statut: member.statut || 'actif'
    }));

    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des membres'
    });
  }
};

exports.getMemberById = async (req, res) => {
  try {
    const member = await Member.getById(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Membre non trouvé'
      });
    }
    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération du membre'
    });
  }
};

exports.createMember = async (req, res) => {
  try {
    const memberData = normalizeMemberData(req.body);
    console.log('Received memberData:', req.body);
    const { error } = memberSchema.validate(memberData);
    if (error) {
      if (req.file) await fs.unlink(req.file.path).catch(console.error);
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    if (req.file) {
      memberData.photo_url = `/uploads/members/${req.file.filename}`;
    }

    if (!memberData.date_expiration) {
      memberData.date_expiration = calculateExpirationDate(
        memberData.date_adhesion,
        memberData.type_adhesion,
        memberData.pack
      );
    }

    const memberId = await Member.create(memberData);
    const newMember = await Member.getById(memberId);

    res.status(201).json({
      success: true,
      data: newMember
    });
  } catch (error) {
    console.error('Error creating member:', error);
    if (req.file) await fs.unlink(req.file.path).catch(console.error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la création du membre'
    });
  }
};

function calculateExpirationDate(startDate, type, pack) {
  const expirationDate = new Date(startDate);
  let months = 1;

  if (type === 'femme') {
    months = 1;
  } else {
    switch (pack) {
      case '3mois':
      case '3moisDuo': months = 3; break;
      case '6mois':
      case '6moisDuo': months = 6; break;
      case '12mois':
      case '12moisDuo': months = 12; break;
    }
  }

  expirationDate.setMonth(expirationDate.getMonth() + months);
  return expirationDate.toISOString().split('T')[0];
}

exports.updateMember = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      prix_paye: req.body.prix_paye ? Number(req.body.prix_paye) : undefined,
      assurance_payee: req.body.assurance_payee === 'true' || req.body.assurance_payee === true
    };

    const { error } = memberSchema.validate(updateData, { allowUnknown: true });
    if (error) {
      if (req.file) await fs.unlink(req.file.path).catch(console.error);
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    if (req.file) {
      const existingMember = await Member.getById(req.params.id);
      if (existingMember && existingMember.photo_url && !existingMember.photo_url.includes('default-avatar')) {
        const oldFilename = path.basename(existingMember.photo_url);
        const oldPath = path.join(__dirname, '../uploads/members', oldFilename);
        if (await fs.access(oldPath).then(() => true).catch(() => false)) {
          await fs.unlink(oldPath);
        }
      }
      updateData.photo_url = `/uploads/members/${req.file.filename}`;
    }

    await Member.update(req.params.id, updateData);
    const updatedMember = await Member.getById(req.params.id);

    res.json({
      success: true,
      data: updatedMember
    });
  } catch (error) {
    console.error('Error updating member:', error);
    if (req.file) await fs.unlink(req.file.path).catch(console.error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la mise à jour du membre'
    });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    console.log('Attempting to delete member with ID:', req.params.id);
    const member = await Member.getById(req.params.id);
    if (!member) {
      console.log('Member not found:', req.params.id);
      return res.status(404).json({
        success: false,
        error: 'Membre non trouvé'
      });
    }

    console.log('Member found:', member);
    // Archiver et supprimer les transactions associées
    const archivedCount = await Transaction.archiveTransactions(req.params.id);
    console.log(`Archived ${archivedCount} transactions for member ID ${req.params.id}`);
    const deletedCount = await Transaction.deleteByMemberId(req.params.id);
    console.log(`Deleted ${deletedCount} transactions for member ID ${req.params.id}`);

    if (member.photo_url && !member.photo_url.includes('default-avatar')) {
      const filename = path.basename(member.photo_url);
      const filePath = path.join(__dirname, '../uploads/members', filename);
      console.log('Attempting to delete photo at:', filePath);
      if (await fs.access(filePath).then(() => true).catch(() => false)) {
        await fs.unlink(filePath);
        console.log('Photo deleted successfully');
      } else {
        console.log('Photo file not found at:', filePath);
      }
    }

    await Member.delete(req.params.id);
    console.log('Member deleted successfully:', req.params.id);
    res.json({
      success: true,
      message: 'Membre supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la suppression du membre'
    });
  }
};

exports.getExpiredMembers = async (req, res) => {
  try {
    const expiredMembers = await Member.getExpiredMembers();
    res.json({
      success: true,
      data: expiredMembers,
      count: expiredMembers.length
    });
  } catch (error) {
    console.error('Error fetching expired members:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des membres expirés'
    });
  }
};

exports.getRenewalInfo = async (req, res) => {
  try {
    const memberId = req.params.id;
    const currentMembership = await Member.getCurrentMembership(memberId);

    if (!currentMembership) {
      return res.status(404).json({
        success: false,
        error: 'Membre non trouvé'
      });
    }

    const newEndDate = new Date(currentMembership.date_expiration);
    let months = 1;

    if (currentMembership.type_adhesion === 'femme') {
      months = 1;
    } else {
      switch (currentMembership.pack) {
        case '3mois':
        case '3moisDuo': months = 3; break;
        case '6mois':
        case '6moisDuo': months = 6; break;
        case '12mois':
        case '12moisDuo': months = 12; break;
        default: months = 1;
      }
    }

    newEndDate.setMonth(newEndDate.getMonth() + months);
    const amount = await Member.calculateRenewalAmount(
      currentMembership.type_adhesion,
      currentMembership.pack
    );

    res.json({
      success: true,
      data: {
        currentPeriod: {
          start: currentMembership.date_adhesion,
          end: currentMembership.date_expiration
        },
        newPeriod: {
          start: currentMembership.date_expiration,
          end: newEndDate.toISOString().split('T')[0]
        },
        amount: amount,
        membershipType: currentMembership.type_adhesion,
        pack: currentMembership.pack
      }
    });
  } catch (error) {
    console.error('Error getting renewal info:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des informations de renouvellement'
    });
  }
};

exports.processRenewal = async (req, res) => {
  try {
    const memberId = req.params.id;
    const { paymentMethod } = req.body;

    console.log('Processing renewal for member ID:', memberId, 'with paymentMethod:', paymentMethod);
    const member = await Member.getById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Membre non trouvé'
      });
    }

    // Débogage de la valeur de date_expiration
    console.log('Raw member.date_expiration:', member.date_expiration);
    const expirationDate = new Date(member.date_expiration);
    console.log('Parsed expirationDate:', expirationDate);

    if (isNaN(expirationDate.getTime())) {
      console.error('Invalid date_expiration value:', member.date_expiration, 'for member:', memberId);
      return res.status(400).json({
        success: false,
        error: 'Date d\'expiration invalide'
      });
    }

    const newEndDate = new Date(expirationDate);
    let months = 1;

    if (member.type_adhesion === 'femme') {
      months = 1;
    } else {
      switch (member.pack) {
        case '3mois':
        case '3moisDuo': months = 3; break;
        case '6mois':
        case '6moisDuo': months = 6; break;
        case '12mois':
        case '12moisDuo': months = 12; break;
        default: months = 1;
      }
    }

    newEndDate.setMonth(newEndDate.getMonth() + months);
    const amount = await Member.calculateRenewalAmount(member.type_adhesion, member.pack);
    console.log('Calculated newEndDate:', newEndDate.toISOString().split('T')[0], 'amount:', amount);

    const transactionId = await Member.renewMembership(memberId, {
      newEndDate: newEndDate.toISOString().split('T')[0],
      amount: amount,
      paymentMethod: paymentMethod
    });
    console.log('Renewal processed, transactionId:', transactionId);

    res.json({
      success: true,
      data: {
        transactionId: transactionId,
        newEndDate: newEndDate.toISOString().split('T')[0],
        amount: amount
      }
    });
  } catch (error) {
    console.error('Error processing renewal:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors du traitement du renouvellement'
    });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier téléchargé'
      });
    }

    const member = await Member.getById(req.params.id);
    if (member && member.photo_url && !member.photo_url.includes('default-avatar')) {
      const oldFilename = path.basename(member.photo_url);
      const oldPath = path.join(__dirname, '../uploads/members', oldFilename);
      if (await fs.access(oldPath).then(() => true).catch(() => false)) {
        await fs.unlink(oldPath);
      }
    }

    const photoUrl = `/uploads/members/${req.file.filename}`;
    await Member.update(req.params.id, { photo_url: photoUrl });

    res.json({
      success: true,
      data: {
        photo_url: photoUrl
      }
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors du téléchargement de la photo'
    });
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    const member = await Member.getById(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Membre non trouvé'
      });
    }

    if (member.photo_url && !member.photo_url.includes('default-avatar')) {
      const filename = path.basename(member.photo_url);
      const filePath = path.join(__dirname, '../uploads/members', filename);
      if (await fs.access(filePath).then(() => true).catch(() => false)) {
        await fs.unlink(filePath);
      }
      await Member.update(req.params.id, { photo_url: null });
    }

    res.json({
      success: true,
      message: 'Photo supprimée avec succès'
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la suppression de la photo'
    });
  }
};