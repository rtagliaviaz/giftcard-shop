import {Entity, PrimaryColumn, Column} from "typeorm";

@Entity({ name: "settings" }) // Maps this class to the 'settings' table
export class Settings {
    @PrimaryColumn({ type: "varchar", length: 50, name: "setting_key" })
    settingKey!: string; // Primary key for the setting, e.g., 'last_address_index'

    @Column({ type: "int" })
    value!: number; // The value of the setting, e.g., the last used address index
}