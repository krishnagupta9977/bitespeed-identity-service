A robust Node.js service designed to identify and link multiple contact records belonging to the same customer. This ensures a "Single Source of Truth" even when customers provide varying contact details across different orders.

## Tech StackRuntime: 
Node.jsFramework: Express.jsDatabase: MongoDBObject Modeling: Mongoose

## Data Model: 
ContactEach contact entry in the MongoDB collection follows this 
schema:FieldTypeDescription_idObjectIdAuto-generated unique identifier.emailStringCustomer's email address (Optional).phoneNumberStringCustomer's phone number (Optional).linkedIdObjectIdPoints to the _id of the Primary contact.linkPrecedenceStringEither "primary" or "secondary".createdAtDateTimestamp of record creation.updatedAtDateTimestamp of last modification.deletedAtDateTimestamp for soft deletion.

## API SpecificationEndpoint:
 POST /identifyConsolidates contact information based on provided credentials.Request Body:JSON{
  "email": "example@test.com",
  "phoneNumber": "1234567890"
}

## Validation: 
At least one field (email or phoneNumber) must be present.Response Format (200 OK):JSON{
  "contact": {
    "primaryContactId": "string",
    "emails": ["string"],
    "phoneNumbers": ["string"],
    "secondaryContactIds": ["string"]
  }
}

## Controller Logic & Workflow
1. Request HandlingExtracts email and phoneNumber.Returns 400 Bad Request if both fields are null.
2. Search & MatchQueries the database for any record matching the provided email OR phoneNumber.If no match exists: Creates a new Primary contact.If match exists: Aggregates all related contacts (including those linked via linkedId) into a unique set.
3. Primary Selection & MergingThe "Oldest Wins" Rule: All gathered contacts are sorted by createdAt.The oldest record is identified as the True Primary.Any other records previously marked as "primary" are demoted to Secondary, and their linkedId is updated to point to the True Primary.
4. ExpansionIf the incoming request contains a new email or phone number not currently in the contact group, a new Secondary record is created and linked to the True Primary.
5. Final Response ConstructionCollects all unique emails (Primary first).Collects all unique phone numbers (Primary first).Lists all associated Secondary IDs.
💡
 Edge Cases HandledCaseSystem ActionNew CustomerCreates a new Primary record.Existing CustomerReturns the current consolidated group.New MetadataIf a known customer uses a new email, a Secondary record is added.Primary CollisionIf two different Primary clusters are linked by a new order, the newer cluster is merged into the older one.ConsistencyThe oldest record always remains the anchor for the identity.