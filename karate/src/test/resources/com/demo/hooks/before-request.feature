@ignore
Feature: Hook previo a la petición HTTP
  # El caller puede definir `payloadPath`; si no, se usa el JSON por defecto de demo.

  Scenario:
    * def resolvedPath = karate.get('payloadPath', 'classpath:testdata/pet-available.json')
    * def requestBody = read(resolvedPath)
