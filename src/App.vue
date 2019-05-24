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
                    solo
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
          <td>
            <v-edit-dialog
              :return-value.sync="props.item.word"
              lazy
              persistent
              autofocus
              large
              @save="save(props.item)"
              @cancel="cancel"
              @open="open"
              @close="close"
            >
              {{ props.item.word }}
              <template v-slot:input>
                <v-text-field
                  v-model="props.item.word"
                  :rules="[noSpace, noEnglish]"
                  label="Edit"
                  single-line
                  counter
                ></v-text-field>
              </template>
            </v-edit-dialog>
          </td>
          <td class="text-xs-right">
            <v-edit-dialog
              :return-value.sync="props.item.pos||true"
              lazy
              persistent
              large
              @save="save(props.item)"
              @cancel="cancel"
              @open="open"
              @close="close"
            >
              {{ posLabel(props.item.pos) || "Select" }}
              <template v-slot:input>
                <v-select
                  solo
                  v-model="props.item.pos"
                  :items="pos"
                  label="Part of speech"
                  item-text="tag"
                  item-value="id"
                ></v-select>
              </template>
            </v-edit-dialog>
          </td>


          <td class="justify-center layout px-0" v-if="props.item.pos">
            <v-icon
              v-if="props.item.pos && props.item.reviewed"
              color="primary"
              @click="toggle_done(props.item)"
            >check_circle</v-icon>
            <v-icon v-else color="secondary" @click="toggle_done(props.item)">check</v-icon>
              <v-icon color="secondary" @click="remove(props.item)">clear</v-icon>
          </td>
          <td v-else class="justify-center layout px-0">
            <v-icon color="secondary" disabled>check</v-icon>
            <v-icon color="secondary" @click="remove(props.item)">clear</v-icon>
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
      { text: "Word", value: "word", align: "left" },
      { text: "Part of speech", value: "pos", align: "left" },
      { text: "Actions", value: "name", sortable: true, align: "left" }
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
       lexiconRef.child(item[".key"]).remove()
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