import Mailgen from 'mailgen';
import transporter from '../config/NodeMailer.config';

type EmailProps = {
	name: string;
	email: string;
	subject: string;
	intro: string;
	outro?: string;
	instructions: string;
	buttonTxt?: string;
	buttonLink?: string;
};

export default async function SendEmail({
	name,
	email,
	subject,
	intro,
	outro,
	instructions,
	buttonTxt,
	buttonLink,
}: EmailProps) {
	const mailGenerator = new Mailgen({
		theme: 'default',
		product: {
			name: 'Quizify',
			link: 'https://mailgen.js/',
		},
	});

	const template = {
		body: {
			name,
			intro: intro || '',
			action: {
				instructions: instructions || '',
				button: {
					color: '#22BC66',
					text: buttonTxt || '',
					link: buttonLink || '',
				},
			},
			outro: outro || '',
		},
	};

	const emailBody = mailGenerator.generate(template);

	let EmailMassage = {
		from: process.env.EMAIL,
		to: email,
		subject: subject,
		html: emailBody,
		inReplyTo: undefined,
		references: undefined,
	};

	try {
		await transporter.sendMail(EmailMassage);
		return { message: 'Email sent successfully' };
	} catch (error) {
		return { message: 'Error sending email' };
	}
}
