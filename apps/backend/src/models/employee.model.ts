import {
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { Event } from "./event.model";

@Table({ tableName: "employees", timestamps: false })
export class Employee extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  declare uuid: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @HasMany(() => Event, { foreignKey: "handlerUuid" })
  declare events: Event[];
}
