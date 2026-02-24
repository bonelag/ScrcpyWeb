import fs from 'fs';
import path from 'path';

let rootDir = process.cwd();
if (path.basename(rootDir) === 'dist') {
    rootDir = path.dirname(rootDir);
}

const SETTINGS_FILE = path.join(rootDir, 'device-settings.json');

export class DeviceSettingsService {
    private static instance: DeviceSettingsService;
    private settings: Record<string, any> = {};

    private constructor() {
        this.load();
    }

    public static getInstance(): DeviceSettingsService {
        if (!this.instance) {
            this.instance = new DeviceSettingsService();
        }
        return this.instance;
    }

    private load() {
        if (fs.existsSync(SETTINGS_FILE)) {
            try {
                const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
                this.settings = JSON.parse(data);
            } catch (e) {
                console.error('Failed to load device settings:', e);
            }
        }
    }

    private save() {
        try {
            fs.writeFileSync(SETTINGS_FILE, JSON.stringify(this.settings, null, 4));
        } catch (e) {
            console.error('Failed to save device settings:', e);
        }
    }

    public getSettings(udid: string): any {
        return this.settings[udid] || null;
    }

    public saveSettings(udid: string, settings: any) {
        this.settings[udid] = settings;
        this.save();
    }
}
