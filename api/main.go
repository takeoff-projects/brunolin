package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"cloud.google.com/go/datastore"
	"github.com/gorilla/mux"
)

type Product struct {
	Id       string `json:"prodId"`
	Name     string `json:"name"`
	Category string `json:"category"`
	TempZone string `json:"temp"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

var Products []Product
var datastoreClient *datastore.Client

func main() {
	ctx := context.Background()
	projectID := os.Getenv("GOOGLE_PROJECT_ID")

	var err error
	datastoreClient, err = datastore.NewClient(ctx, projectID)

	if err != nil {
		log.Fatal(err)
	}
	defer datastoreClient.Close()

	Products = []Product{
		{Id: "BL001", Name: "Ice Cream", Category: "Diary", TempZone: "frozen"},
		{Id: "BL002", Name: "Chocolate", Category: "Candy", TempZone: "cool"},
		{Id: "BL003", Name: "Bread", Category: "Diary", TempZone: "cool"},
	}
	myRouter := mux.NewRouter().StrictSlash(true)

	myRouter.HandleFunc("/", indexHandler)
	myRouter.HandleFunc("/products", allProducts).Methods("GET")
	myRouter.HandleFunc("/products/{id}", getProduct).Methods("GET")
	myRouter.HandleFunc("/products", createProduct).Methods("POST")

	// [START setting_port]
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
		log.Printf("Defaulting to port %s", port)
	}

	log.Printf("Listening on port %s", port)
	if err := http.ListenAndServe(":"+port, myRouter); err != nil {
		log.Fatal(err)
	}
}

func indexHandler(w http.ResponseWriter, r *http.Request) {

	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	fmt.Fprint(w, "Hello, World!")
}

func allProducts(w http.ResponseWriter, r *http.Request) {
	fmt.Println("/products endpoint")

	// json.NewEncoder(w).Encode(Products)

	var (
		ctx    context.Context
		cancel context.CancelFunc
	)

	ctx, cancel = context.WithCancel((context.Background()))
	defer cancel()

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	var products []*Product

	keys, err := datastoreClient.GetAll(ctx, datastore.NewQuery("Product"), &products)
	if err != nil {
		// TODO: Handle error.
		fmt.Println(err)
	}

	for i, key := range keys {
		fmt.Println(key)
		fmt.Println(products[i])
	}

	json.NewEncoder(w).Encode(products)

}

func getProduct(w http.ResponseWriter, r *http.Request) {
	var (
		ctx    context.Context
		cancel context.CancelFunc
	)

	ctx, cancel = context.WithCancel((context.Background()))
	defer cancel()

	// get id
	vars := mux.Vars(r)
	key := vars["id"]

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	var singleProduct Product

	datastoreKey := datastore.NameKey("Product", key, nil)
	err := datastoreClient.Get(ctx, datastoreKey, &singleProduct)
	if err != nil {
		w.WriteHeader(404)
		errorJson := ErrorResponse{Error: err.Error()}
		json.NewEncoder(w).Encode(errorJson)
		fmt.Printf("%v", err)
	} else {
		fmt.Printf("%v", singleProduct)
		json.NewEncoder(w).Encode(singleProduct)
	}

}

func createProduct(w http.ResponseWriter, r *http.Request) {

	var (
		ctx    context.Context
		cancel context.CancelFunc
	)

	ctx, cancel = context.WithCancel((context.Background()))
	defer cancel()

	fmt.Println("Post Product")
	// w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	reqBody, _ := ioutil.ReadAll(r.Body)
	var newProduct Product
	// json.NewDecoder(r.Body).Decode(&newProduct)
	json.Unmarshal(reqBody, &newProduct)

	productKey := datastore.NameKey("Product", newProduct.Id, nil)
	if _, err := datastoreClient.Put(ctx, productKey, &newProduct); err != nil {
		log.Fatalf("Failed to save product: %v", err)
	}
	w.WriteHeader(200)
	json.NewEncoder(w).Encode(newProduct)

}
