export class SDKDocument
{
    constructor
    (
        public title: string,
        public url:string,
        public children: Array<SDKDocument>
    ) 
    {
        
    }
}