//
import {
  DataTypes,
  Model,
  Sequelize,
  // BuildOptions,
  // HasManyGetAssociationsMixin,
  // HasManyAddAssociationMixin,
  // HasManyHasAssociationMixin,
  // Association,
  // HasManyCountAssociationsMixin,
  // HasManyCreateAssociationMixin
} from 'sequelize';



class Url extends Model {
  public id!: number;
  public url!: string;
}

class VenueUrl extends Model {
  public id!: number;
  public url!: string;
}

class NoteId extends Model {
  public id!: number;
  public noteId!: string;
}

class Order extends Model {
  public id!: number;
}

export class OrderEntry extends Model {
  public id!: number;
  public order!: number;
  public url!: number;
  public venue!: number;
  public note!: number;
  public source!: string; // a record containing the original fields as provided by the openreview team
}


export const Table = {
  Url,
  VenueUrl,
  Order,
  OrderEntry,
  NoteId,
};

export function initTables(sql: Sequelize): void {
  const opts = {
    sequelize: sql,
    timestamps: true,
  }

  Url.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    url: { type: DataTypes.STRING, allowNull: false, unique: true },
  }, opts);

  VenueUrl.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    url: { type: DataTypes.STRING, allowNull: false, unique: true },
  }, opts);

  NoteId.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    noteId: { type: DataTypes.STRING, allowNull: false, unique: true },
  }, opts);

  Order.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  }, opts);

  OrderEntry.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order: { type: DataTypes.INTEGER },
    url: { type: DataTypes.INTEGER },
    venue: { type: DataTypes.INTEGER },
    note: { type: DataTypes.INTEGER },
    source: { type: DataTypes.JSON },
  }, opts);


  Order.hasMany(OrderEntry, {
    sourceKey: 'id',
    foreignKey: 'order',
    as: 'entries',
  });

  OrderEntry.belongsTo(Order)
}

export async function openDB(storagePath: string|undefined): Promise<Sequelize> {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath? storagePath : ':memory:',
    logging: false, // or console.log,

    // database: '',
    // username: '',
    // password: '',
  });

  return sequelize
    .authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
      return sequelize;
    })
    .catch((err: any) => {
      console.error('Unable to connect to the database:', err);
      throw err;
    });
}

// identifier: { type: Sequelize.STRING, primaryKey: true },
// incrementMe: { type: Sequelize.INTEGER, autoIncrement: true },
// class User extends Model {
//   public id!: number; // Note that the `null assertion` `!` is required in strict mode.
//   public name!: string;
//   public preferredName!: string | null; // for nullable fields

//   // timestamps!
//   public readonly createdAt!: Date;
//   public readonly updatedAt!: Date;

//   // Since TS cannot determine model association at compile time
//   // we have to declare them here purely virtually
//   // these will not exist until `Model.init` was called.

//   // public getProjects!: HasManyGetAssociationsMixin<Project>; // Note the null assertions!
//   // public addProject!: HasManyAddAssociationMixin<Project, number>;
//   // public hasProject!: HasManyHasAssociationMixin<Project, number>;
//   // public countProjects!: HasManyCountAssociationsMixin;
//   // public createProject!: HasManyCreateAssociationMixin<Project>;

//   // You can also pre-declare possible inclusions, these will only be populated if you
//   // actively include a relation.
//   // public readonly projects?: Project[]; // Note this is optional since it's only populated when explicitly requested in code

//   // public static associations: {
//   //   projects: Association<User, Project>;
//   // };
// }
