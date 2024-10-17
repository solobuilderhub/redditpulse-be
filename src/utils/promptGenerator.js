const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
};

const truncatePost = (postBody, maxLength = 500) => {
  if (postBody.length <= maxLength) return postBody;

  const ellipsis = "...";
  const charsToShow = maxLength - ellipsis.length;
  const frontChars = Math.ceil(charsToShow * 0.6); // Show more of the beginning
  const backChars = Math.floor(charsToShow * 0.4); // Show less of the end

  const beginning = postBody.substring(0, frontChars);
  const end = postBody.substring(postBody.length - backChars);

  return `${beginning}${ellipsis}${end}`;
};

export const generatePrompt = (persona, postBody, tone) => {
  // Truncate job role if it's too long (e.g., more than 50 characters)
  const truncatedJob = truncateText(persona.job, 50);

  // Truncate tone if it's too long (e.g., more than 30 characters)
  const truncatedTone = truncateText(tone, 100);

  return `
  Assume you have the following persona.

  <UserPersona>
  User Persona:
  - Job Role: ${truncatedJob}
  - Experience: ${persona.experience} years
  - Industry: ${persona.industry}
  - Expertise: ${persona.expertise}
  - Niche: ${persona.niche}
  </UserPersona>

  **Reply LinkedIn comment to the appropriate user:**

  <PostContext>
  ${postBody}
  </PostContext>

  Based on the above context, reply to the appropriate LinkedIn post.
  Tone: ${truncatedTone}
  `;
};
