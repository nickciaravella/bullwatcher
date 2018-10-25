import * as React from 'react'


export default class Footer extends React.Component<any, any> {
    public render() {
        return (
            <div className="pt-3 border bg-dark text-light" style={{marginTop: "100px"}}>
                <div className="d-flex flex-row justify-content-center">
                    <a className="mr-3 text-light" href="https://www.facebook.com/bullwatchercom">Facebook</a>
                    <p className="mr-3"> | </p>
                    <a className="mr-3 text-light" href="https://twitter.com/bullwatchercom">Twitter</a>
                </div>
                <div className="d-flex flex-row justify-content-center">
                    <a className="mr-3 text-light" href="#">Privacy Policy</a>
                    <p className="mr-3"> | </p>
                    <a className="mr-3 text-light" href="#">Terms and Conditions</a>
                </div>
            </div>
        )
    }
}