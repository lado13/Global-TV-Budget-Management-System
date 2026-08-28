import { NamedEntity } from '../shared/models/named-entity';

/** Matches EnginerDto from Global.Budget.Ge API. */
export interface Enginner extends NamedEntity {
  imageUrl?: string;
}
