"use client";

const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijkmnopqrstuvwxyz";
const NUMBERS = "23456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{}";

function randomFrom(source: string) {
  return source[Math.floor(Math.random() * source.length)] ?? "";
}

function shuffle(values: string[]) {
  const items = [...values];

  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }

  return items;
}

export function generateStrongPassword() {
  const length = 12 + Math.floor(Math.random() * 5);
  const requiredCharacters = [
    randomFrom(UPPERCASE),
    randomFrom(LOWERCASE),
    randomFrom(NUMBERS),
    randomFrom(SYMBOLS),
  ];
  const allCharacters = `${UPPERCASE}${LOWERCASE}${NUMBERS}${SYMBOLS}`;

  while (requiredCharacters.length < length) {
    requiredCharacters.push(randomFrom(allCharacters));
  }

  return shuffle(requiredCharacters).join("");
}
