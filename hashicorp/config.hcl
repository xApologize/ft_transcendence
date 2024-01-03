disable_mlock = true
ui            = true

listener "tcp" {
  address       = "vault:8200"
  tls_cert_file = "/vault/tls/fullchain.pem"
  tls_key_file  = "/vault/tls/private-key.pem"
}

storage "file" {
  path = "/vault/data"
}

cluster_addr = "https://127.0.0.1:8201"
api_addr = "https://127.0.0.1:8200"
