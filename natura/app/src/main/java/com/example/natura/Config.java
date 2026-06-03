package com.example.natura;

public class Config {
    // CAMBIA ESTA IP UNA SOLA VEZ CUANDO SEA NECESARIO
    public static final String IP_SERVER = "172.17.2.26";
    
    // URLS BASE
    public static final String BASE_URL = "http://" + IP_SERVER + "/natura_api/";
    public static final String URL_BUSCAR_NOMBRE = BASE_URL + "buscar_nombre.php?nombre=";
}
