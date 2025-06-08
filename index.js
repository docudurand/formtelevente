import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const salesMap = {
  'Jean Dupont':   'd.pichard2007@gmail.com',
  'Camille Martin':'magvl4gleize@durandservices.fr',
  'Sarah Lopez':   'angeliquemanin@hotmail.fr'
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

app.post('/api/send-order', async (req, res) => {
  const { client, salesperson, html } = req.body;

  const to = salesMap[salesperson] || process.env.DEFAULT_TO;
  if (!to) return res.status(400).json({ success:false, error:'no_recipient' });

  const mailOptions = {
    from: `"Bon de Commande" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Nouveau bon de commande – ${client || 'Client inconnu'}`,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, error:'email_failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('API prête sur le port', PORT));
