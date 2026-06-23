import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { Event } from "./event.model";

@Table({
  tableName: "registrations",
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ["eventUuid", "registrationNo"],
    },
  ],
})
export class Registration extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  declare uuid: string;

  @ForeignKey(() => Event)
  @Column({ type: DataType.UUID, allowNull: false })
  declare eventUuid: string;

  @BelongsTo(() => Event, { foreignKey: "eventUuid" })
  declare event: Event;

  @Column({ type: DataType.STRING, allowNull: false })
  declare emailAddress: string;

  @Column({ type: DataType.STRING(5), allowNull: false })
  declare registrationNo: string;
}
