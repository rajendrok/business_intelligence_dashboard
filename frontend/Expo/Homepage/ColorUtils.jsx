export const getColorForKey = (key) => {
  const colors = [
    "#ffe0e0", // light red
    "#e0ffe0", // light green
    "#e0e0ff", // light blue
    "#fff4e0", // light orange
    "#e0fff8", // aqua
    "#f8e0ff", // pink
    "#f0e0ff", // lavender
  ];

  // Hash: add char codes of the string
  const hash = key.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Pick a color based on hash
  return colors[hash % colors.length];
};
