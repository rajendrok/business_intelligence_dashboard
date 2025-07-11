import { StyleSheet } from "react-native";

export default StyleSheet.create({
  page: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  gridContainer: {
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  connectionCard: {
    marginBottom: 10,
    width: "60%",
  },
  dbSelectorRow: {
    maxHeight: 200,
    marginTop: 13,
    zIndex: 5,
  },
  dbSelectorScroll: {
    flexDirection: "row",
    alignItems: "center",
  },
  plusButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  dbItem: {
    backgroundColor: "#e6f0ff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007bff",
    marginRight: 6,
  },
  dbText: {
    fontWeight: "bold",
    color: "#007bff",
  },
  joinButton: {
    backgroundColor: "#fff8e1",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#aaa",
    marginRight: 6,
  },

  dropdownContainer: {
    position: "absolute",
    top: -20,
    left: 50,
    maxHeight: 200,
    width: 220,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,

    // Ensures top stacking
    zIndex: 9999, // ✅ higher than anything else
    elevation: 20, // ✅ for Android stacking
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  dropdownItem: {
    backgroundColor: "#e6f0ff",
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  dropdownText: {
    fontWeight: "bold",
    color: "#00509e",
  },
  loadButton: {
    marginTop: 130,
    marginVertical: 20,
  },
  resultBox: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    width: "90%",
    maxWidth: 800,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  operationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  opCard: {
    alignItems: "center",
    padding: 10,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 10,
    marginBottom: 10,
  },
  opCardSelected: {
    borderColor: "#007BFF",
  },
  opImage: {
    width: 80,
    height: 80,
    marginBottom: 5,
    resizeMode: "contain",
  },
  opLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  modalButtons: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
});
