// Readable, never-admin-typed temporary passwords (build doc §10), e.g.
// "Maple-Tiger-4829". Shown once to the admin to DM the new user.
const ADJ = ["Maple", "Cedar", "Amber", "Ruby", "Coral", "Ivory", "Slate", "Cobalt", "Olive", "Hazel", "Frost", "Ember", "Willow", "Saffron"];
const NOUN = ["Tiger", "Falcon", "Otter", "Heron", "Comet", "Harbor", "Cypress", "Lark", "Bison", "Quartz", "Marlin", "Sparrow", "Juniper", "Meadow"];

export function tempPassword(): string {
  const a = ADJ[Math.floor(Math.random() * ADJ.length)];
  const n = NOUN[Math.floor(Math.random() * NOUN.length)];
  const num = 1000 + Math.floor(Math.random() * 9000);
  return `${a}-${n}-${num}`;
}
