package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"time"

	"cloud.google.com/go/datastore"
	"cloud.google.com/go/storage"
	"github.com/gorilla/mux"
)

type Product struct {
	Id       string `datastore:"Id" json:"prodId"`
	Name     string `datastore:"Name" json:"name"`
	Category string `datastore:"Category" json:"category"`
	TempZone string `datastore:"TempZone" json:"temp"`
}

type ProdErrorInfo struct {
	LineErrors []string `datastore:"line_errors" json:"line_errors"`
	Id         string   `datastore:"id" json:"id"`
}
type EtlInfo struct {
	Filename string          `datastore:"filename" json:"filename"`
	Errors   []ProdErrorInfo `datastore:"errors" json:"errors"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

var Products []Product
var datastoreClient *datastore.Client
var bucketClient *storage.Client

func main() {
	ctx := context.Background()
	projectID := os.Getenv("GOOGLE_PROJECT_ID")

	// init datastore client
	var err error
	datastoreClient, err = datastore.NewClient(ctx, projectID)

	if err != nil {
		log.Fatal(err)
	}
	defer datastoreClient.Close()

	// init cloud storage client

	bucketClient, err = storage.NewClient(ctx)

	if err != nil {
		fmt.Printf("storage.NewClient: %v", err)
	}
	defer bucketClient.Close()
	// Products = []Product{
	// 	{Id: "BL001", Name: "Ice Cream", Category: "Diary", TempZone: "frozen"},
	// 	{Id: "BL002", Name: "Chocolate", Category: "Candy", TempZone: "cool"},
	// 	{Id: "BL003", Name: "Bread", Category: "Diary", TempZone: "cool"},
	// }
	myRouter := mux.NewRouter().StrictSlash(true)

	myRouter.HandleFunc("/", indexHandler)
	myRouter.HandleFunc("/products", allProducts).Methods("GET")
	myRouter.HandleFunc("/products/{id}", getProduct).Methods("GET")
	myRouter.HandleFunc("/products", createProduct).Methods("POST")
	myRouter.HandleFunc("/files", getEtlErrors).Methods("GET")
	myRouter.HandleFunc("/files", pushEtlFile).Methods("POST")

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

func getEtlErrors(w http.ResponseWriter, r *http.Request) {
	fmt.Println("/etl errors endpoint")

	// json.NewEncoder(w).Encode(Products)

	var (
		ctx    context.Context
		cancel context.CancelFunc
	)

	ctx, cancel = context.WithCancel((context.Background()))
	defer cancel()

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	var etlSlice []*EtlInfo

	keys, err := datastoreClient.GetAll(ctx, datastore.NewQuery("Etl"), &etlSlice)
	if err != nil {
		// TODO: Handle error.
		fmt.Println(err)
	}

	for i, key := range keys {
		fmt.Println(key)
		fmt.Println(etlSlice[i])
	}
	if len(etlSlice) > 0 {
		json.NewEncoder(w).Encode(etlSlice)
	} else {
		json.NewEncoder(w).Encode([]EtlInfo{})
	}

}

func pushEtlFile(w http.ResponseWriter, r *http.Request) {

	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		fmt.Printf("%v", err)
	}

	// n := r.Form.Get("name")
	// fmt.Printf("n:%v \n", n)

	// Retrieve the file from form data
	f, h, err := r.FormFile("filename")

	if err != nil {
		fmt.Printf("%v", err)
	}
	defer f.Close()
	fmt.Printf("%v", h.Filename)

	if err := uploadFile(f, "etl_app_files", h.Filename, context.Background()); err != nil {
		errorJson := ErrorResponse{Error: err.Error()}
		json.NewEncoder(w).Encode(errorJson)
		fmt.Printf("%v", err)
	} else {
		fmt.Println("File Upload Succesful")
		// w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		json.NewEncoder(w).Encode(struct{ Message string }{"Sucessfully uploaded file"})

	}

}

func uploadFile(file multipart.File, bucket string, object string, ctx context.Context) error {

	ctx, cancel := context.WithTimeout(ctx, time.Second*50)
	defer cancel()

	// Upload an object with storage.Writer.
	var err error
	wc := bucketClient.Bucket(bucket).Object(object).NewWriter(ctx)
	if _, err = io.Copy(wc, file); err != nil {
		fmt.Printf("io.Copy: %v", err)
	}
	if err := wc.Close(); err != nil {
		fmt.Printf("Writer.Close: %v", err)
	}
	// fmt.Fprintf(w, "Blob %v uploaded.\n", object)
	return nil
}
