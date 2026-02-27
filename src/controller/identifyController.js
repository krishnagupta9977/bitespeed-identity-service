import { Contact } from "../models/Contact.js";
import { Op } from "sequelize";

// Main controller to identify and link customer contacts
export const identifyContact = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    // 1. Validation: Ensure at least one field is provided
    if (!email && !phoneNumber) {
      return res.status(400).json({ message: "Email or phoneNumber is required" });
    }

    // 2. Find all contacts that match either the provided email or phoneNumber
    const matchedContacts = await Contact.findAll({
      where: {
        [Op.or]: [
          email ? { email } : null,
          phoneNumber ? { phoneNumber } : null,
        ].filter(Boolean),
      },
    });

    // 3. Scenario: New Customer (No existing records found)
    if (matchedContacts.length === 0) {
      const newPrimary = await Contact.create({
        email,
        phoneNumber,
        linkPrecedence: "primary",
      });

      return res.status(200).json({
        contact: {
          primaryContactId: newPrimary.id,
          emails: email ? [email] : [],
          phoneNumbers: phoneNumber ? [phoneNumber] : [],
          secondaryContactIds: [],
        },
      });
    }

    // 4. Identify all related Primary IDs from the matched results
    let primaryIds = new Set();
    matchedContacts.forEach((contact) => {
      if (contact.linkPrecedence === "primary") {
        primaryIds.add(contact.id);
      } else {
        primaryIds.add(contact.linkedId);
      }
    });

    // 5. Fetch all contacts belonging to these identified primary clusters
    let allRelatedContacts = await Contact.findAll({
      where: {
        [Op.or]: [
          { id: { [Op.in]: Array.from(primaryIds) } },
          { linkedId: { [Op.in]: Array.from(primaryIds) } },
        ],
      },
    });

    // 6. Find the True Primary (The oldest record in the entire group)
    allRelatedContacts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const truePrimary = allRelatedContacts[0];

    // 7. Handle Merging: Demote newer primaries to secondary if multiple clusters meet
    for (let contact of allRelatedContacts) {
      if (contact.linkPrecedence === "primary" && contact.id !== truePrimary.id) {
        contact.linkPrecedence = "secondary";
        contact.linkedId = truePrimary.id;
        await contact.save();
      }
    }

    // 8. Check if the current request introduces new information (new email or phone)
    const emailExists = allRelatedContacts.some((c) => c.email === email);
    const phoneExists = allRelatedContacts.some((c) => c.phoneNumber === phoneNumber);

    // If new info is present, create a new secondary record linked to the True Primary
    if ((email && !emailExists) || (phoneNumber && !phoneExists)) {
      const newSecondary = await Contact.create({
        email,
        phoneNumber,
        linkedId: truePrimary.id,
        linkPrecedence: "secondary",
      });
      allRelatedContacts.push(newSecondary);
    }

    // 9. Consolidate unique emails, phone numbers, and secondary IDs for response
    const emails = new Set();
    const phoneNumbers = new Set();
    const secondaryContactIds = [];

    // Ensure the primary contact's info appears first in the arrays
    if (truePrimary.email) emails.add(truePrimary.email);
    if (truePrimary.phoneNumber) phoneNumbers.add(truePrimary.phoneNumber);

    allRelatedContacts.forEach((c) => {
      if (c.email) emails.add(c.email);
      if (c.phoneNumber) phoneNumbers.add(c.phoneNumber);
      if (c.id !== truePrimary.id) {
        secondaryContactIds.push(c.id);
      }
    });

    // 10. Return the consolidated contact information
    return res.status(200).json({
      contact: {
        primaryContactId: truePrimary.id,
        emails: Array.from(emails),
        phoneNumbers: Array.from(phoneNumbers),
        secondaryContactIds: [...new Set(secondaryContactIds)],
      },
    });

  } catch (error) {
    console.error("Identity Reconciliation Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};