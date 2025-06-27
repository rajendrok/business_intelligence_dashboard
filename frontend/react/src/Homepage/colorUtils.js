export const getColorForKey = (key) => {
  const colors = ["#ffe0e0", "#e0ffe0", "#e0e0ff", "#fff4e0", "#e0fff8", "#f8e0ff", "#f0e0ff"];
  const hash = key.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};
