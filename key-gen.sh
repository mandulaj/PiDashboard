#!/bin/bash

mkdir keys
cd keys

## Generate a 2048 bit RSA key (set this valus to 4096 if you are paranoid)
openssl genrsa -out server.key 2048

## Make a certificate request file
openssl req -new -key server.key -out server.csr

## Write a self signed certificate to the crt file
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
