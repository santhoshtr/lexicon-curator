<template>
  <v-app>
    <v-toolbar dark color="primary" app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Lexicon Curator</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn flat href="https://gitlab.com/smc/mlmorph" target="_blank">
        <span class="mr-2">Mlmorph</span>
      </v-btn>
      <v-dialog v-model="dialog" max-width="500px">
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="headline">Add new word</span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="newItem.word" label="Word"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-select
                    v-model="newItem.pos"
                    :items="pos"
                    label="Part of speech"
                    item-text="tag"
                    item-value="id"
                  ></v-select>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat @click="close">Cancel</v-btn>
            <v-btn flat @click="save">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-toolbar>

    <v-content>
      <v-data-table :headers="headers" :items="lexicon" class="elevation-1">
        <template v-slot:items="props">
          <td class="text-xs-right word">
            <v-layout column>
              <v-text-field v-model="props.item.word" :rules="[noSpace, noEnglish]"></v-text-field>

              <v-select
                v-model="props.item.pos"
                :items="pos"
                item-text="tag"
                item-value="id"
                placeholder="Select part of speech"
              ></v-select>
            </v-layout>
          </td>

          <td class="justify-center layout px-0 actions" v-if="props.item.pos">
            <v-layout column>
              <v-btn
                v-disabled="!props.item.pos"
                large
                icon
                color="primary"
                @click="toggle_done(props.item)"
              >
                <v-icon>check</v-icon>
              </v-btn>
              <v-btn large icon color="error" @click="remove(props.item)">
                <v-icon>delete</v-icon>
              </v-btn>
            </v-layout>
          </td>
          <td v-else class="justify-center layout px-0">
            <v-layout column>
              <v-btn large icon color="primary" disabled>
                <v-icon>check</v-icon>
              </v-btn>
              <v-btn large icon color="error" @click="remove(props.item)">
                <v-icon>delete</v-icon>
              </v-btn>
            </v-layout>
          </td>
        </template>
      </v-data-table>
    </v-content>
  </v-app>
</template>

<script>
import firebase from "firebase";

let firebaseConfig = {
  apiKey: "AIzaSyC0CaFyRgU-r5BVuQba5ZHkKcuq_bPqYEA",
  authDomain: "malayalam-lexicon.firebaseapp.com",
  databaseURL: "https://malayalam-lexicon.firebaseio.com",
  projectId: "malayalam-lexicon",
  storageBucket: "malayalam-lexicon.appspot.com",
  messagingSenderId: "315238496708",
  appId: "1:315238496708:web:1ef03988fde804b4"
};

// Initialize Firebase
const db = firebase.initializeApp(firebaseConfig).database();
const lexiconRef = db.ref("lexicon");
export default {
  firebase: {
    lexicon: lexiconRef.orderByChild("reviewed"),
    pos: {
      source: db.ref("tags"),
      cancelCallback(err) {
        console.error(err);
      }
    }
  },
  data: () => ({
    lexicon: [],
    pos: [],
    dialog: false,
    noSpace: v => v.indexOf(" ") < 0 || "Space not allowed",
    noEnglish: v => v.match(/[a-zA-Z0-9]/) === null || "Please enter Malayalam",
    headers: [
      { text: "Word", sortable: false },
      { text: "Action", sortable: false }
    ],
    newItem: {
      word: "",
      pos: "",
      reviewed: false
    }
  }),

  watch: {
    dialog(val) {
      val || this.close();
    }
  },

  methods: {
    posLabel(posId) {
      let matchingPos = this.pos.filter(pItem => pItem.id === posId);
      return (matchingPos.length && matchingPos[0].tag) || posId;
    },
    save(item) {
      lexiconRef.child(item[".key"]).set({
        word: item.word,
        pos: item.pos,
        reviewed: item.reviewed || false
      });
    },
    toggle_done(item) {
      lexiconRef.child(item[".key"]).set({
        word: item.word,
        pos: item.pos,
        reviewed: !item.reviewed
      });
    },
    add(newItem) {
      lexiconRef.push(newItem);
    },
    remove(item) {
      lexiconRef.child(item[".key"]).remove();
    },
    close() {
      this.dialog = false;
    },
    open() {
      // Edit dialog open
    },
    cancel() {
      // Edit dialog cancel
    }
  }
};
</script>
<style>
input {
  border: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", "Manjari", sans-serif;
  font-size: 1em;
}
</style>