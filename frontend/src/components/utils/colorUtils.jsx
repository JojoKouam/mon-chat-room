const colors = [
  '#FFC107', // Ambre
  '#28A745', // Vert
  '#007BFF', // Bleu
  '#DC3545', // Rouge
  '#6F42C1', // Violet
  '#FD7E14', // Orange
  '#20C997', // Turquoise
];

// Cette fonction prend un string (le nom du salon) et retourne une couleur de la liste
export const getColorFromString = (str) => {
  if (!str) return colors[0];
  
  // On calcule une "valeur" pour le string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // On utilise cette valeur pour choisir une couleur dans notre tableau
  const index = Math.abs(hash % colors.length);
  return colors[index];
};