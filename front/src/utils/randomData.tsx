export const randomWord = () => {
  const words = ["Accueil", "Profil", "Paramètres", "Messages", "Tableau", "Projets", "Statistiques", "Aide", "Calendrier", "Favoris"];
  return words[Math.floor(Math.random() * words.length)];
};

export const randomSentence = () => {
  const sentences = [
    "Bienvenue sur votre tableau de bord.",
    "Voici vos dernières activités.",
    "N’hésitez pas à explorer les fonctionnalités.",
    "Vous avez 3 nouvelles notifications.",
    "Vos projets sont en bonne voie.",
  ];
  return sentences[Math.floor(Math.random() * sentences.length)];
};
