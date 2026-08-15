// Builds a small, valid one-page PDF for the demo account so the CV panel has
// something to preview out of the box. It is generated from the demo profile
// rather than written out by hand, so the document always agrees with the name,
// location and stack shown everywhere else in the demo.
// The base-14 Helvetica used here is latin1-encoded, so typographic characters
// have no glyph and silently drop out of the rendered page. They are folded to
// ASCII before escaping.
const ASCII = [
  [/[\u2014\u2013]/g, '-'],
  [/[\u2018\u2019]/g, "'"],
  [/[\u201c\u201d]/g, '"'],
  [/\u2026/g, '...'],
  [/\u00a0/g, ' '],
];

const escape = (text) => {
  const folded = ASCII.reduce(
    (value, [pattern, replacement]) => value.replace(pattern, replacement),
    String(text)
  );
  return folded.replace(/([()\\])/g, '\\$1');
};

const lines = (profile) => {
  const fullName = `${profile.name} ${profile.lastName}`.trim();
  return [
    [24, 720, fullName],
    [12, 692, profile.headline],
    [12, 674, `${profile.location} - ${profile.email}`],
    [13, 636, 'PROFILE'],
    [10, 614, `Looking for a ${profile.desiredRole} role.`],
    [10, 598, `${profile.yearsExperience} years of experience. Open to remote work.`],
    [13, 560, 'EXPERIENCE'],
    [11, 538, 'Senior Engineer, Example Ltd (2021 - present)'],
    [10, 520, 'Led the rebuild of a customer-facing booking platform.'],
    [10, 504, 'Cut page load time by 60% and set up the CI pipeline.'],
    [11, 474, 'Engineer, Sample Co (2018 - 2021)'],
    [10, 456, 'Built internal tools and a reporting dashboard.'],
    [13, 418, 'SKILLS'],
    [10, 396, profile.stack.join(', ')],
    [13, 358, 'EDUCATION'],
    [10, 336, 'BSc Computer Science'],
    [9, 280, 'Sample document for the Talentifyx demo account.'],
  ];
};

export const buildSampleCv = (profile) => {
  const content = lines(profile)
    .filter(([, , text]) => text)
    .map(([size, y, text]) => `BT /F1 ${size} Tf 72 ${y} Td (${escape(text)}) Tj ET`)
    .join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] ' +
      '/Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xref}\n%%EOF`;

  return Buffer.from(pdf, 'latin1');
};

export const sampleCvFilename = (profile) =>
  `${`${profile.name} ${profile.lastName}`.trim().replace(/\s+/g, '-')}-CV.pdf`;
