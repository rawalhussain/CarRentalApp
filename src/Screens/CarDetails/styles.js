import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  stickyHeader: {
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  headerText: {
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 18,
    marginVertical: 8,
  },
  button: {
    backgroundColor: '#E63946',
    padding: 10,
    borderRadius: 5,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  section: {
    marginVertical: 10,
  },
  subtitle: {
    fontWeight: '600',
    marginBottom: 5,
  },
  link: {
    color: '#007bff',
    marginTop: 4,
  },
  footer: {
    marginVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default styles;
