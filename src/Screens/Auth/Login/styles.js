import { StyleSheet } from 'react-native';
import {Colors} from '../../../Themes/MyColors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GREY,
  },
  containerTop: {
    marginTop: 65,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  carIcon: {
    width: 36,
    height: 36,
  },
  carTopTitle: {
    marginLeft: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  form: {
    paddingHorizontal: 20,
  },
  layoutRemember: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPassword: {
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
  },
  button: {
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: Colors.PRIMARY_GREY,
  },
  footerLink: {
    fontSize: 16,
    color: Colors.BLACK,
    fontWeight: '600',
  },
  orContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  line: {
    flex: 1,
    borderColor: Colors.LINE_GRAY,
    borderTopWidth: 1,
  },
  orText: {
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
    paddingHorizontal: 20,
  },
});

export default styles;
