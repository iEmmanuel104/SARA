// src/common/localization/localization.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import i18next, { i18n, TOptions } from 'i18next';
import Backend from 'i18next-fs-backend';
import { join } from 'path';

@Injectable()
export class LocalizationService implements OnModuleInit {
    private readonly logger = new Logger(LocalizationService.name);
    private i18n: i18n;

    constructor(private readonly configService: ConfigService) {
        this.i18n = i18next.createInstance();
    }

    async onModuleInit() {
        const localesPath = join(process.cwd(), 'locales');

        await this.i18n
            .use(Backend)
            .init({
                backend: {
                    loadPath: join(localesPath, '{{lng}}', '{{ns}}.json'),
                },
                lng: this.configService.get('DEFAULT_LANGUAGE', 'en'),
                fallbackLng: 'en',
                preload: ['en', 'es', 'fr', 'de', 'it'],
                ns: ['common', 'validation', 'errors'],
                defaultNS: 'common',
                interpolation: {
                    escapeValue: false,
                },
            });
    }

    async translate(key: string, options?: TOptions): Promise<string> {
        return this.i18n.t(key, options);
    }

    async getLanguages(): Promise<string[]> {
        return Object.keys(this.i18n.services.resourceStore.data);
    }

    async getTranslations(lng: string): Promise<Record<string, any>> {
        const resources: Record<string, any> = {};
        const namespaces = this.i18n.options.ns as string[];

        for (const ns of namespaces) {
            const bundle = await this.i18n.getResourceBundle(lng, ns);
            if (bundle) {
                resources[ns] = bundle;
            }
        }

        return resources;
    }

    async isLanguageSupported(lng: string): Promise<boolean> {
        const languages = await this.getLanguages();
        return languages.includes(lng);
    }

    getFallbackLanguage(): string {
        return this.i18n.options.fallbackLng as string;
    }

    async formatDate(date: Date, options: {
        lng?: string;
        format?: string;
    } = {}) {
        const { lng = 'en', format = 'default' } = options;
        const dateFormat = new Intl.DateTimeFormat(lng, {
            dateStyle: format === 'short' ? 'short' : 'long',
            timeStyle: format === 'short' ? 'short' : 'long',
        });
        return dateFormat.format(date);
    }

    async formatCurrency(amount: number, options: {
        lng?: string;
        currency?: string;
    } = {}) {
        const { lng = 'en', currency = 'USD' } = options;
        const formatter = new Intl.NumberFormat(lng, {
            style: 'currency',
            currency,
        });
        return formatter.format(amount);
    }

    async formatNumber(number: number, options: {
        lng?: string;
        style?: 'decimal' | 'percent';
        minimumFractionDigits?: number;
        maximumFractionDigits?: number;
    } = {}) {
        const {
            lng = 'en',
            style = 'decimal',
            minimumFractionDigits = 0,
            maximumFractionDigits = 2,
        } = options;

        const formatter = new Intl.NumberFormat(lng, {
            style,
            minimumFractionDigits,
            maximumFractionDigits,
        });
        return formatter.format(number);
    }
} 