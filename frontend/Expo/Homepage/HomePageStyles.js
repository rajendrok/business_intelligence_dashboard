import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  page: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  gridContainer: {
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  connectionCard: {
    marginBottom: 10,
  },
  loadButton: {
    marginVertical: 20,
  },
  resultBox: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '90%',
    maxWidth: 800,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  operationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  opCard: {
    alignItems: 'center',
    padding: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 10,
    marginBottom: 10,
  },
  opCardSelected: {
    borderColor: '#007BFF',
  },
  opImage: {
    width: 80,
    height: 80,
    marginBottom: 5,
    resizeMode: 'contain',
  },
  opLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  modalButtons: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap', // let buttons stack if screen is narrow
  },
});
