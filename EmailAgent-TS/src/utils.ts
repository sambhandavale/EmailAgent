export function decodeBase64Url(base64String: string): string {
  const buff = Buffer.from(base64String, 'base64url');
  return buff.toString('utf8');
}

export function parseGmailMessage(msg: any) {
  const headers = msg.payload.headers.reduce((acc: any, h: any) => {
    acc[h.name.toLowerCase()] = h.value;
    return acc;
  }, {});

  let body = '';
  function getParts(payload: any) {
    if (payload.parts) {
      payload.parts.forEach((p: any) => {
        if (p.mimeType === 'text/plain' && p.body?.data) {
          body += decodeBase64Url(p.body.data);
        } else if (p.parts) {
          getParts(p);
        }
      });
    } else if (payload.body?.data) {
      body += decodeBase64Url(payload.body.data);
    }
  }
  getParts(msg.payload);

  return {
    from: headers['from'] || '',
    subject: headers['subject'] || '',
    date: headers['date'] || '',
    body,
    metadata: { headers }
  };
}
