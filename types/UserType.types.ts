export  type user= {
  username: string;
  password: string;
}
export type Boat = {
  id: string;
  name: string;
  goldCargo: number;
  createdAt  : Date;
  captain: string;
  status: 'docked' | 'sailing' | 'lookingForAFight';
  crewSize: number;
  createdBy : string;
  lastModified : Date;
  timesPillaged:number;
};
export type BoatRequest = {
  name: string;
  goldCargo: number;
  captain: string;
  status: 'docked' | 'sailing' | 'lookingForAFight';
  crewSize: number;
};

export type BoatRequestUpdate = {
  name:string;
  goldCargo: number;
  captain: string;
  crewSize: number;
};
