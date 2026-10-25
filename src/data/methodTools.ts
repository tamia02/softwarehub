/**
 * The Methods page's browser tools (names + one-line descriptions). Kept out of
 * the "use client" component so server pages can read the list/count too; the
 * component maps each id to its implementation.
 */
export const methodTools = [
  { id: "Base64Tool", name: "Base64 Encoder / Decoder", desc: "Text ⇄ Base64" },
  { id: "JwtTool", name: "JWT Reader", desc: "Decode a token's header & payload" },
  { id: "HashTool", name: "SHA-256 Hash", desc: "Hash any text" },
  { id: "JsonTool", name: "JSON Formatter", desc: "Beautify & validate JSON" },
  { id: "UrlTool", name: "URL Encoder / Decoder", desc: "Percent-encode text" },
  { id: "UuidTool", name: "UUID Generator", desc: "Secure random v4 IDs" },
  { id: "PasswordTool", name: "Password Generator", desc: "Strong random passwords" },
  { id: "CaseTool", name: "Case Converter", desc: "UPPER / kebab / snake / Title" },
  { id: "HexTool", name: "Hex ⇄ Text", desc: "Convert text to hex and back" },
  { id: "TimestampTool", name: "Unix Timestamp", desc: "Epoch ⇄ readable date" },
] as const;

export type MethodToolId = (typeof methodTools)[number]["id"];
