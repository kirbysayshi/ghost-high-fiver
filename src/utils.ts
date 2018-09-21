
export function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export async function delay(action: () => void, delay = 300) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      action();
      resolve();
    }, delay);
  });
}