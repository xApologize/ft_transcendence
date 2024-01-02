disable_mlock = true
ui            = true

listener "tcp" {
  address       = "vault:8200"
  tls_cert_file = "/vault/tls/fullchain.pem"
  tls_key_file  = "/vault/tls/server.pem"
}

storage "postgresql" {
  connection_url  = "postgresql://gewg:erjej@postgres:5432/postgresql"
  table           = "vault_table"
}
