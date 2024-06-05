// pages/api/token.js
import { RtcTokenBuilder, RtcRole } from "agora-token";
export async function POST(req) {
  const { channelName, uid } = req.body;
  if (!channelName || !uid) {
    return NextResponse.json(
      { error: "channelName and uid are required" },
      { status: 400 }
    );
  }
  const appID = "be94233ca8de442db2fdb0bc167f39ab";
  const appCertificate = "1cf05cabd4ce44bc98dd8c2b2eb23092";
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
  const token = RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );
  return NextResponse.json({ token });
}

// import dotenv from 'dotenv';

// dotenv.config();

// export default function handler(req, res) {
//   if (req.method === 'POST') {
//     const { channelName, uid } = req.body;

//     if (!channelName || !uid) {
//       return res.status(400).json({ error: 'channelName and uid are required' });
//     }

//     const appID = process.env.AGORA_APP_ID;
//     const appCertificate = process.env.AGORA_APP_CERTIFICATE;
//     const role = RtcRole.PUBLISHER;
//     const expirationTimeInSeconds = 3600;
//     const currentTimestamp = Math.floor(Date.now() / 1000);
//     const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

//     const token = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpiredTs);

//     res.status(200).json({ token });
//   } else {
//     res.status(405).json({ error: 'Method not allowed' });
//   }
// }
