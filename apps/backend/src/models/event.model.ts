import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { Employee } from "./employee.model";
import { Registration } from "./registration.model";

@Table({ tableName: "events", timestamps: true })
export class Event extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  declare uuid: string;

  @Unique
  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare dateTime: Date;

  @Column({ type: DataType.STRING, allowNull: false })
  declare address: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare deadline: Date;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare capacity: number;

  @ForeignKey(() => Employee)
  @Column({ type: DataType.UUID, allowNull: false })
  declare handlerUuid: string;

  @BelongsTo(() => Employee, { foreignKey: "handlerUuid" })
  declare handler: Employee;

  @HasMany(() => Registration, { foreignKey: "eventUuid" })
  declare registrations: Registration[];
}
