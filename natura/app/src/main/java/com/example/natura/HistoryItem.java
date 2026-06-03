package com.example.natura;

public class HistoryItem {
    private String id;
    private String plantName;
    private String scientificName;
    private String date;
    private String imageBase64;

    public HistoryItem(String id, String plantName, String scientificName, String date, String imageBase64) {
        this.id = id;
        this.plantName = plantName;
        this.scientificName = scientificName;
        this.date = date;
        this.imageBase64 = imageBase64;
    }

    public String getId() { return id; }
    public String getPlantName() { return plantName; }
    public String getScientificName() { return scientificName; }
    public String getDate() { return date; }
    public String getImageBase64() { return imageBase64; }
}