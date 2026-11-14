-- =====================================================
--  CodeRoad : schéma MySQL + données de départ
--  Lancer :  mysql -u root -p < schema.sql
-- =====================================================


SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS coderoad CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE coderoad;

-- On supprime dans l'ordre inverse des dépendances pour pouvoir relancer le script
DROP TABLE IF EXISTS attempts;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS levels;
DROP TABLE IF EXISTS users;

-- Les comptes utilisateurs
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(30)  NOT NULL UNIQUE,
  email         VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Les 5 niveaux de la roadmap
CREATE TABLE levels (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  position    INT NOT NULL UNIQUE,          -- 1, 2, 3, 4, 5 : l'ordre dans la roadmap
  title       VARCHAR(60)  NOT NULL,
  description VARCHAR(160) NOT NULL
) ENGINE=InnoDB;

-- Les exercices (QCM) : chacun appartient à un niveau
CREATE TABLE exercises (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  level_id      INT NOT NULL,
  question      VARCHAR(300) NOT NULL,
  options       JSON NOT NULL,              -- ["réponse A", "réponse B", ...]
  correct_index TINYINT NOT NULL,           -- position de la bonne réponse (0, 1, 2...)
  explanation   VARCHAR(400) NOT NULL,
  FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Chaque réponse donnée par un utilisateur
CREATE TABLE attempts (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  exercise_id  INT NOT NULL,
  chosen_index TINYINT NOT NULL,
  is_correct   BOOLEAN NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
  INDEX idx_attempts_user (user_id)
) ENGINE=InnoDB;

-- ---------- Données de départ ----------
INSERT INTO levels (id, position, title, description) VALUES
  (1, 1, 'Bases',            'Variables, boucles et tableaux'),
  (2, 2, 'Tableaux et tris', 'Parcours et tri par sélection'),
  (3, 3, 'Récursivité',      'Cas de base et piles d''appels'),
  (4, 4, 'Graphes',          'Parcours en largeur et en profondeur'),
  (5, 5, 'Programmation dynamique', 'Éviter de recalculer les sous-problèmes');

INSERT INTO exercises (level_id, question, options, correct_index, explanation) VALUES
 (1, 'Combien d''itérations fait la boucle « pour i de 1 à 5 » ?',
     '["4","5","6","1"]', 1,
     'Les bornes sont incluses : i prend les valeurs 1, 2, 3, 4 et 5, donc 5 itérations.'),
 (1, 'Quelle est la valeur de x après : x = 3 ; x = x + 2 ; x = x * 2 ?',
     '["7","10","8","12"]', 1,
     'x vaut 3, puis 5 (3 + 2), puis 10 (5 × 2).'),
 (1, 'Quel est l''indice du premier élément d''un tableau en C, Java, JavaScript ou Python ?',
     '["0","1","-1","Cela dépend de la taille"]', 0,
     'Les indices commencent à 0 : le premier élément est T[0].'),

 (2, 'Que fait le tri par sélection à chaque tour ?',
     '["Il cherche le minimum de la partie non triée et le place au début de cette partie","Il échange toujours deux voisins","Il coupe le tableau en deux","Il choisit un élément au hasard"]', 0,
     'À chaque tour, on repère le plus petit élément restant puis on l''échange avec la première case non triée.'),
 (2, 'Quelle est la complexité du tri par sélection dans le pire des cas ?',
     '["O(n)","O(n log n)","O(n²)","O(log n)"]', 2,
     'Deux boucles imbriquées : environ n × n / 2 comparaisons, soit O(n²).'),
 (2, 'On trie [5, 2, 4] par sélection. Quel est le tableau après le premier tour ?',
     '["[2, 5, 4]","[2, 4, 5]","[5, 2, 4]","[4, 2, 5]"]', 0,
     'Le minimum est 2 (indice 1). On l''échange avec T[0] = 5 : on obtient [2, 5, 4].'),

 (3, 'Qu''est-ce que le cas de base d''une fonction récursive ?',
     '["La condition qui arrête les appels récursifs","Le premier appel de la fonction","L''appel le plus coûteux","Une variable globale"]', 0,
     'Le cas de base est la situation où la fonction répond sans s''appeler elle-même : il stoppe la récursion.'),
 (3, 'Sachant que factorielle(4) = 4 × factorielle(3), que vaut factorielle(4) ?',
     '["10","16","24","12"]', 2,
     'factorielle(4) = 4 × 3 × 2 × 1 = 24.'),
 (3, 'Que se passe-t-il si une fonction récursive n''a pas de cas de base ?',
     '["Elle s''arrête toute seule","Elle déborde de la pile d''appels (stack overflow)","Elle renvoie 0","Elle s''exécute une seule fois"]', 1,
     'Les appels s''empilent sans fin jusqu''à saturer la pile d''appels : c''est un dépassement de pile.'),

 (4, 'Quelle structure de données le parcours en largeur (BFS) utilise-t-il ?',
     '["Une pile","Une file","Un arbre binaire","Un tas"]', 1,
     'BFS visite les sommets par distance croissante : il utilise une file (premier entré, premier sorti).'),
 (4, 'Quelle structure le parcours en profondeur (DFS) itératif utilise-t-il ?',
     '["Une file","Une pile","Un tableau trié","Une table de hachage"]', 1,
     'DFS s''enfonce le plus loin possible puis revient en arrière : c''est le comportement d''une pile.'),

 (5, 'Que cherche à éviter la programmation dynamique ?',
     '["Recalculer plusieurs fois les mêmes sous-problèmes","Utiliser des boucles","Utiliser de la mémoire","Écrire des fonctions"]', 0,
     'On mémorise le résultat de chaque sous-problème pour ne le calculer qu''une seule fois.'),
 (5, 'Dans la suite de Fibonacci (F0 = 0, F1 = 1), combien vaut F6 ?',
     '["5","8","13","11"]', 1,
     'La suite est 0, 1, 1, 2, 3, 5, 8 : F6 = 8.');
