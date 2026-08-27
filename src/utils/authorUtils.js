export const ICMU_AUTHOR_NAME = "Isipathana College Media Unit";

export const isInstitutionAuthor = (author) => {
  const normalized = String(author || "").trim().toLowerCase();
  return !normalized || normalized === "admin" || normalized === "isipathanamedia" || normalized === ICMU_AUTHOR_NAME.toLowerCase();
};

export const getPublicAuthorName = (author) =>
  isInstitutionAuthor(author) ? ICMU_AUTHOR_NAME : String(author).trim();
