# Tropicos Obra Princeps
Script para buscar a obra princeps de espécies usando a API do [Tropicos.org](https://services.tropicos.org/help).

# Instalação
``` 
git clone https://github.com/vicentecalfo/tropicos-obra-princeps.git
cd tropicos-obra-princeps
npm install
```

# Utilização
`node src -i ARQUIVO-CSV-COM-AS-ESPECIES.csv -o ARQUIVO-DE-SAIDA-COM-AS-ESPECIES-E-SUAS-OBRAS.csv -k APIKEY-TROPICOS`

Exemplo:

`node src -i lista-especie.csv -o lista-especie-obra-princeps.csv -k 12345-56786-fghtey-5674`

# Modelo padrão da planilha de entrada
Olhar o arquivo `input.csv`. 

# Informações gerais
* As espécies não encontradas serão informadas num arquivo com o mesmo nome informado no output, mas com um sufixo `-notFound`;
* Os nomes científicos devem ter o autor;
* Para usar a API do Tropicos.org você precisará de uma chave de acesso que pode ser solicitada [aqui](https://services.tropicos.org/help?requestkey).