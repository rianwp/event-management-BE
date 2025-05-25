import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import { readFile } from 'fs/promises';
import Handlebars from 'handlebars';
import { join, resolve } from 'path';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private templateDir: string;

  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('GMAIL_EMAIL'),
        pass: this.configService.get('GMAIL_APP_PASSWORD'),
      },
    });

    this.templateDir = resolve(process.cwd(), '../static/templates/');
  }

  async renderTemplate(templateName: string, context: object) {
    const templatePath = join(this.templateDir, `${templateName}.hbs`);

    const templateSource = (await readFile(templatePath)).toString();

    const compiledTemplate = Handlebars.compile(templateSource);

    return compiledTemplate(context);
  }

  async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    context: object,
  ) {
    const html = await this.renderTemplate(templateName, context);

    await this.transporter.sendMail({
      from: 'Blog app',
      to: to,
      subject: subject,
      html: html,
    });
  }
}
