import {Entity, PrimaryColumn, Column} from "typeorm";

@Entity({ name: "settings" }) 
export class Settings {
    @PrimaryColumn({ type: "varchar", length: 50, name: "setting_key" })
    settingKey!: string; 

    @Column({ type: "int" })
    value!: number; // last used address index
}