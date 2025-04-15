import * as crypto from "crypto";

// Định nghĩa kiểu cho các tham số và giá trị trả về
export default function generateSignature(
  queryString: string,
  hashSecret: string
): string {
  const hmac = crypto.createHmac("sha512", hashSecret);
  hmac.update(Buffer.from(queryString, "utf-8"));
  const hashCode = hmac.digest("hex");
  return hashCode;
}
