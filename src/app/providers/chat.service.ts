import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { Mensaje } from '../interfaces/mensaje.interface';

import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';

@Injectable()
export class ChatService {
  private itemsCollection: AngularFirestoreCollection<Mensaje> | undefined;

  public chats: any[] = [];
  public usuario: any = {};
  constructor(private afs: AngularFirestore, public auth: AngularFireAuth) {


    this.auth.authState.subscribe(user => {
      console.log('Estado del usuario', user);

      if(!user){
        return;
      }
      this.usuario.nombre = user.displayName;
      this.usuario.uid = user.uid;
    })
  }

  login(proovedor: string) {
    if(proovedor === 'google') {

      this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }else {
      this.auth.signInWithPopup( new firebase.auth.OAuthProvider('yahoo.com') );

    }


  }
  logout() {
    this.usuario = {};
    this.auth.signOut();
  }

  cargarMensajes() {
    this.itemsCollection = this.afs.collection<Mensaje>('chats', ref=>ref.orderBy('fecha', 'desc').limit(5));
    return this.itemsCollection.valueChanges().pipe(map(mensajes => {
      console.log(mensajes);
      this.chats = mensajes;

      this.chats = [];
      for (const mensaje of mensajes) {
          this.chats.unshift(mensaje);
      }
      return this.chats;
  }));
  }

  agregarMensajes(texto: string) {
    const mensaje: Mensaje = {
      nombre: this.usuario.nombre,
      mensaje: texto,
      fecha: new Date().getTime(),
      uid: this.usuario.uid
    }
    return this.itemsCollection?.add(mensaje);
  }
}
