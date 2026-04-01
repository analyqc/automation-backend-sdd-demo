Feature: Regresión Pet API (SDD + esquema + hooks)
  # Validación alineada al contrato OpenAPI: forma del recurso Pet (no igualdad al archivo JSON Schema crudo).

  Background:
    * url baseUrl

  @smoke @regression
  Scenario: POST /pet — validación de esquema tras crear con datos JSON de precondición
    # Precondición: carga payload desde testdata
    * def payloadPath = 'classpath:testdata/pet-available.json'
    * call read('classpath:com/demo/hooks/before-request.feature')
    * path 'pet'
    * request requestBody
    * method post
    * status 200
    * match response contains { name: 'Karate-Demo-Pet', status: 'available' }
    * match response.photoUrls == '#array'
    * match response.name == 'Karate-Demo-Pet'
    * match response.status == 'available'
    # Postcondición: limpieza
    * call read('classpath:com/demo/hooks/after-request.feature')

  @regression
  Scenario: GET /pet/{id} — POST con id estable (evita pérdida de precisión con ids 64-bit del servidor)
    * def httpMethod = 'post'
    * def pathSuffix = 'pet'
    * def payloadPath = 'classpath:testdata/pet-stable-id.json'
    * call read('classpath:com/demo/hooks/request-with-hooks.feature')
    * match response contains { id: 798234561, name: 'Karate-Demo-Pet', status: 'available' }
    * def createdId = response.id
    * path 'pet', createdId
    * method get
    * status 200
    * match response contains { id: 798234561, name: 'Karate-Demo-Pet', status: 'available' }
    * match response.photoUrls == '#array'
    * call read('classpath:com/demo/hooks/delete-pet.feature') { petId: createdId }

  @negative
  Scenario: GET pet inválido — 404
    * path 'pet', 999999999999
    * method get
    * status 404
