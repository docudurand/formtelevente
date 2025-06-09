import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

app.get('/healthz', (_req, res) => {
  res.sendStatus(200);
});

const salesMap = {
  'Casti Jeremy':   'comvl2miribel@durandservices.fr',
  'Trenti Anthony': 'comvlchassieu@durandservices.fr',
  'Bazoge Ilona':   'comvl2chassieu@durandservices.fr',
  'Pichard Damien': 'magvl4gleize@durandservices.fr'
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

app.post('/api/send-order', async (req, res) => {
  const { client, salesperson, pdf } = req.body;
  if (!pdf) return res.status(400).json({ success: false, error: 'no_pdf' });
  const to = salesMap[salesperson] || process.env.DEFAULT_TO;
  if (!to) return res.status(400).json({ success: false, error: 'no_recipient' });

  const mail = {
    from: `"Bon de Commande" <${process.env.GMAIL_USER}>`,
    to,
    subject: `BDC - ${salesperson} – ${client || 'Client inconnu'}`,
    text: 'Veuillez trouver le bon de commande en pièce jointe (PDF).',
    attachments: [{
      filename: `Bon_de_Commande_${salesperson} – ${client || 'Client inconnu'}.pdf`,
      content: Buffer.from(pdf, 'base64'),
      contentType: 'application/pdf'
    }]
  };

  try {
    await transporter.sendMail(mail);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: 'email_failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API OK on port ${PORT}`));
