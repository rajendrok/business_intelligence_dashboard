import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 10,
    width: 220,
    elevation: 4,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  logo: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 20,
  },
  menu: {
    flexGrow: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 2,
  },
  menuIcon: {
    marginRight: 10,
  },
  menuText: {
    fontSize: 14,
    color: '#333',
  },
  newProjectBtn: {
    marginTop: 20,
    backgroundColor: '#4c68d7',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  newProjectText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default styles;
