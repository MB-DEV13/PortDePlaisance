README

Port de Plaisance API REST

API REST pour gerer les catways, les utilisateurs et les reservations dun port de plaisance.
Projet realise dans le cadre dune formation en developpement web.

Fonctionnalites :

- Authentification JWT (via cookie ou header)
- Gestion complete des utilisateurs, catways et reservations (CRUD)
- Middleware securise pour proteger les routes privees
- Backend en Node.js + Express + MongoDB (Atlas)
- Interface possible via EJS pour ladministration

Installation :

1. Cloner le depot : git clone https://github.com/ton-utilisateur/port-de-plaisance.git
2. Se placer dans le dossier : cd port-de-plaisance
3. Installer les dependances : npm install
4. Copier et adapter le fichier .env

Exemple de .env :
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=un_secret_super_secure

Lancement :
npm start
Par defaut, l'API est disponible a : http://localhost:3000
