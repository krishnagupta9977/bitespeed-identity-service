Bitespeed Identity Reconciliation Service:

A robust backend service designed to consolidate customer identities across multiple purchases. This service identifies whether different contact details (email or phone number) belong to the same person and links them to a single primary contact using an "Oldest Wins" reconciliation logic.

🚀 Live Deployment
API Endpoint: https://bitespeed-identity-service-d0yj.onrender.com/identify

🛠️ Tech Stack
Runtime: Node.js (v22.14.0)

Framework: Express.js

Database: PostgreSQL (Hosted on Render/External Instance)

ORM: Sequelize

Deployment: Render

✨ Features
Identity Linking: Automatically links contacts if either the email or phone number matches an existing record.

Primary/Secondary Hierarchy: Ensures the oldest record remains "Primary" while newer ones are marked "Secondary".

Cluster Merging: If a request contains information that links two previously separate primary clusters, the newer primary is demoted to secondary.

Unified Response: Returns a consolidated object containing all linked emails, phone numbers, and secondary IDs.


📖 API Documentation
Identify Contact
Method: POST

Path: /identify

Request Body:

JSON
{
  "email": "mcfly@hillvalley.edu",
  "phoneNumber": "123456"
}
Successful Response (200 OK):

JSON
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [2]
  }
}
⚙️ Local Setup
Clone the repository:

Bash
git clone https://github.com/YOUR_USERNAME/bitespeed-identity-service.git
cd bitespeed-identity-service
Install dependencies:

Bash
npm install
Environment Variables:
Create a .env file in the root directory and add your PostgreSQL URI:

Code snippet
DATABASE_URL=your_postgresql_connection_string
PORT=5000
Run the server:

Bash
npm run dev